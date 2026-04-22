from __future__ import annotations

import csv
import json
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Iterable


BASE_DIR = Path(__file__).resolve().parents[1]
INPUT_DIR = BASE_DIR / "data" / "input"
OUTPUT_DIR = BASE_DIR / "data" / "output"


REQUIRED_ORDER_FIELDS = {"id_pedido", "data_pedido", "id_cliente", "valor_total", "status"}
REQUIRED_CLIENT_FIELDS = {"id_cliente", "nome", "cidade", "estado", "data_cadastro"}
REQUIRED_DELIVERY_FIELDS = {
    "id_entrega",
    "id_pedido",
    "data_prevista",
    "status_entrega",
}


@dataclass(frozen=True)
class ConsolidatedOrder:
    id_pedido: str
    nome_cliente: str
    cidade_normalizada: str
    estado: str
    valor_total: Decimal
    status_pedido: str
    data_pedido: datetime
    data_prevista_entrega: datetime | None
    data_realizada_entrega: datetime | None
    atraso_dias: int | None
    status_entrega: str | None

    def to_row(self) -> dict[str, str]:
        return {
            "id_pedido": self.id_pedido,
            "nome_cliente": self.nome_cliente,
            "cidade_normalizada": self.cidade_normalizada,
            "estado": self.estado,
            "valor_total": f"{self.valor_total:.2f}",
            "status_pedido": self.status_pedido,
            "data_pedido": format_datetime(self.data_pedido),
            "data_prevista_entrega": format_datetime(self.data_prevista_entrega),
            "data_realizada_entrega": format_datetime(self.data_realizada_entrega),
            "atraso_dias": "" if self.atraso_dias is None else str(self.atraso_dias),
            "status_entrega": self.status_entrega or "",
        }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    orders, rejected_orders = load_orders(INPUT_DIR / "pedidos.csv")
    clients, rejected_clients = load_clients(INPUT_DIR / "clientes.csv")
    deliveries, rejected_deliveries, orphan_delivery_ids = load_deliveries(
        INPUT_DIR / "entregas.csv",
        valid_order_ids=set(orders.keys()),
    )

    consolidated_orders, missing_client_order_ids = consolidate(orders, clients, deliveries)
    indicators = build_indicators(consolidated_orders)
    quality_report = build_quality_report(
        rejected_orders,
        rejected_clients,
        rejected_deliveries,
        orphan_delivery_ids,
        missing_client_order_ids,
    )

    write_consolidated_csv(OUTPUT_DIR / "consolidado_pedidos.csv", consolidated_orders)
    write_json(OUTPUT_DIR / "indicadores.json", indicators)
    write_json(OUTPUT_DIR / "data_quality_report.json", quality_report)

    print(json.dumps(indicators, indent=2, ensure_ascii=False))


def load_orders(file_path: Path) -> tuple[dict[str, dict[str, object]], list[dict[str, str]]]:
    orders: dict[str, dict[str, object]] = {}
    rejected_rows: list[dict[str, str]] = []

    for row in read_csv(file_path):
        missing_fields = missing_required_fields(row, REQUIRED_ORDER_FIELDS)
        if missing_fields:
            rejected_rows.append(build_rejection(row, "missing_required_fields", missing_fields))
            continue

        try:
            orders[str(row["id_pedido"])] = {
                "id_pedido": str(row["id_pedido"]),
                "data_pedido": parse_date(str(row["data_pedido"])),
                "id_cliente": str(row["id_cliente"]),
                "valor_total": parse_decimal(str(row["valor_total"])),
                "status": normalize_token(str(row["status"])),
            }
        except (ValueError, InvalidOperation) as error:
            rejected_rows.append(build_rejection(row, "invalid_order_row", [str(error)]))

    return orders, rejected_rows


def load_clients(file_path: Path) -> tuple[dict[str, dict[str, object]], list[dict[str, str]]]:
    clients: dict[str, dict[str, object]] = {}
    rejected_rows: list[dict[str, str]] = []

    for row in read_csv(file_path):
        missing_fields = missing_required_fields(row, REQUIRED_CLIENT_FIELDS)
        if missing_fields:
            rejected_rows.append(build_rejection(row, "missing_required_fields", missing_fields))
            continue

        try:
            clients[str(row["id_cliente"])] = {
                "id_cliente": str(row["id_cliente"]),
                "nome": normalize_name(str(row["nome"])),
                "cidade": normalize_city(str(row["cidade"])),
                "estado": normalize_token(str(row["estado"])).upper(),
                "data_cadastro": parse_date(str(row["data_cadastro"])),
            }
        except ValueError as error:
            rejected_rows.append(build_rejection(row, "invalid_client_row", [str(error)]))

    return clients, rejected_rows


def load_deliveries(
    file_path: Path,
    valid_order_ids: set[str],
) -> tuple[dict[str, dict[str, object]], list[dict[str, str]], list[str]]:
    deliveries: dict[str, dict[str, object]] = {}
    rejected_rows: list[dict[str, str]] = []
    orphan_delivery_ids: list[str] = []

    for row in read_csv(file_path):
        missing_fields = missing_required_fields(row, REQUIRED_DELIVERY_FIELDS)
        if missing_fields:
            rejected_rows.append(build_rejection(row, "missing_required_fields", missing_fields))
            continue

        order_id = str(row["id_pedido"])
        if order_id not in valid_order_ids:
            orphan_delivery_ids.append(order_id)
            continue

        try:
            deliveries[order_id] = {
                "id_entrega": str(row["id_entrega"]),
                "id_pedido": order_id,
                "data_prevista": parse_date(str(row["data_prevista"])),
                "data_realizada": parse_optional_date(row.get("data_realizada")),
                "status_entrega": normalize_token(str(row["status_entrega"])),
            }
        except ValueError as error:
            rejected_rows.append(build_rejection(row, "invalid_delivery_row", [str(error)]))

    return deliveries, rejected_rows, orphan_delivery_ids


def consolidate(
    orders: dict[str, dict[str, object]],
    clients: dict[str, dict[str, object]],
    deliveries: dict[str, dict[str, object]],
) -> tuple[list[ConsolidatedOrder], list[str]]:
    consolidated_orders: list[ConsolidatedOrder] = []
    missing_client_order_ids: list[str] = []

    for order_id in sorted(orders):
        order = orders[order_id]
        client_id = str(order["id_cliente"])
        client = clients.get(client_id)

        if client is None:
            missing_client_order_ids.append(order_id)
            continue

        delivery = deliveries.get(order_id)
        expected_date = delivery["data_prevista"] if delivery else None
        delivered_date = delivery["data_realizada"] if delivery else None
        delay_days = compute_delay_days(expected_date, delivered_date)

        consolidated_orders.append(
            ConsolidatedOrder(
                id_pedido=order_id,
                nome_cliente=str(client["nome"]),
                cidade_normalizada=str(client["cidade"]),
                estado=str(client["estado"]),
                valor_total=order["valor_total"],  # type: ignore[arg-type]
                status_pedido=str(order["status"]),
                data_pedido=order["data_pedido"],  # type: ignore[arg-type]
                data_prevista_entrega=expected_date,  # type: ignore[arg-type]
                data_realizada_entrega=delivered_date,  # type: ignore[arg-type]
                atraso_dias=delay_days,
                status_entrega=str(delivery["status_entrega"]) if delivery else None,
            )
        )

    return consolidated_orders, missing_client_order_ids


def build_indicators(consolidated_orders: Iterable[ConsolidatedOrder]) -> dict[str, object]:
    orders = list(consolidated_orders)

    totals_by_status = Counter(order.status_pedido for order in orders)

    revenue_by_state: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    count_by_state: Counter[str] = Counter()
    city_volume: Counter[str] = Counter()
    on_time_deliveries = 0
    delayed_deliveries = 0
    delayed_days: list[int] = []

    for order in orders:
        revenue_by_state[order.estado] += order.valor_total
        count_by_state[order.estado] += 1
        city_volume[order.cidade_normalizada] += 1

        if order.atraso_dias is None:
            continue

        if order.atraso_dias <= 0:
            on_time_deliveries += 1
        else:
            delayed_deliveries += 1
            delayed_days.append(order.atraso_dias)

    ticket_average_by_state = {
        state: f"{(revenue_by_state[state] / count_by_state[state]):.2f}"
        for state in sorted(revenue_by_state)
    }

    total_delivered_with_date = on_time_deliveries + delayed_deliveries
    on_time_percentage = (
        round(on_time_deliveries / total_delivered_with_date * 100, 2)
        if total_delivered_with_date
        else 0
    )
    delayed_percentage = (
        round(delayed_deliveries / total_delivered_with_date * 100, 2)
        if total_delivered_with_date
        else 0
    )

    return {
        "total_pedidos_por_status": dict(sorted(totals_by_status.items())),
        "ticket_medio_por_estado": ticket_average_by_state,
        "percentual_entregas_no_prazo": on_time_percentage,
        "percentual_entregas_com_atraso": delayed_percentage,
        "top_3_cidades_por_volume": city_volume.most_common(3),
        "media_atraso_em_dias_para_pedidos_atrasados": (
            round(sum(delayed_days) / len(delayed_days), 2) if delayed_days else 0
        ),
    }


def build_quality_report(
    rejected_orders: list[dict[str, str]],
    rejected_clients: list[dict[str, str]],
    rejected_deliveries: list[dict[str, str]],
    orphan_delivery_ids: list[str],
    missing_client_order_ids: list[str],
) -> dict[str, object]:
    return {
        "rejected_orders": rejected_orders,
        "rejected_clients": rejected_clients,
        "rejected_deliveries": rejected_deliveries,
        "orphan_delivery_ids": orphan_delivery_ids,
        "orders_without_valid_client": missing_client_order_ids,
        "summary": {
            "rejected_orders_count": len(rejected_orders),
            "rejected_clients_count": len(rejected_clients),
            "rejected_deliveries_count": len(rejected_deliveries),
            "orphan_delivery_count": len(orphan_delivery_ids),
            "orders_without_valid_client_count": len(missing_client_order_ids),
        },
    }


def write_consolidated_csv(file_path: Path, consolidated_orders: Iterable[ConsolidatedOrder]) -> None:
    fieldnames = [
        "id_pedido",
        "nome_cliente",
        "cidade_normalizada",
        "estado",
        "valor_total",
        "status_pedido",
        "data_pedido",
        "data_prevista_entrega",
        "data_realizada_entrega",
        "atraso_dias",
        "status_entrega",
    ]

    with file_path.open("w", newline="", encoding="utf-8") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=fieldnames)
        writer.writeheader()

        for order in consolidated_orders:
            writer.writerow(order.to_row())


def write_json(file_path: Path, payload: dict[str, object]) -> None:
    file_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def read_csv(file_path: Path) -> Iterable[dict[str, str]]:
    with file_path.open("r", newline="", encoding="utf-8") as input_file:
        yield from csv.DictReader(input_file)


def missing_required_fields(row: dict[str, str], required_fields: set[str]) -> list[str]:
    return [
        field
        for field in sorted(required_fields)
        if not str(row.get(field, "")).strip()
    ]


def build_rejection(row: dict[str, str], reason: str, details: list[str]) -> dict[str, str]:
    return {
        "reason": reason,
        "details": ", ".join(details),
        "row": json.dumps(row, ensure_ascii=False),
    }


def parse_date(value: str) -> datetime:
    raw_value = value.strip()
    if not raw_value:
        raise ValueError("Empty date value.")

    if raw_value.isdigit():
        timestamp = int(raw_value)
        if len(raw_value) >= 13:
            timestamp = timestamp // 1000
        return datetime.fromtimestamp(timestamp, tz=timezone.utc).replace(tzinfo=None)

    normalized_value = raw_value.replace("Z", "+00:00")
    try:
        parsed_iso = datetime.fromisoformat(normalized_value)
        return parsed_iso.replace(tzinfo=None)
    except ValueError:
        pass

    for date_format in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(raw_value, date_format)
        except ValueError:
            continue

    raise ValueError(f"Unsupported date format: {value}")


def parse_optional_date(value: object) -> datetime | None:
    text_value = str(value or "").strip()
    if not text_value:
        return None
    return parse_date(text_value)


def parse_decimal(value: str) -> Decimal:
    raw_value = value.strip()
    if not raw_value:
        raise InvalidOperation("Empty decimal value.")

    normalized_value = raw_value.replace(" ", "")

    if "," in normalized_value and "." in normalized_value:
        if normalized_value.rfind(",") > normalized_value.rfind("."):
            normalized_value = normalized_value.replace(".", "").replace(",", ".")
        else:
            normalized_value = normalized_value.replace(",", "")
    elif "," in normalized_value:
        normalized_value = normalized_value.replace(",", ".")

    return Decimal(normalized_value)


def normalize_city(value: str) -> str:
    normalized = normalize_token(value)
    normalized = remove_accents(normalized)
    return " ".join(part.capitalize() for part in normalized.split())


def normalize_name(value: str) -> str:
    normalized = " ".join(value.strip().split())
    if not normalized:
        raise ValueError("Empty customer name.")
    return normalized


def normalize_token(value: str) -> str:
    normalized = " ".join(value.strip().split())
    if not normalized:
        raise ValueError("Empty token value.")
    return normalized.lower()


def remove_accents(value: str) -> str:
    return "".join(
        character
        for character in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(character)
    )


def compute_delay_days(expected_date: object, delivered_date: object) -> int | None:
    if expected_date is None or delivered_date is None:
        return None

    expected = expected_date if isinstance(expected_date, datetime) else None
    delivered = delivered_date if isinstance(delivered_date, datetime) else None

    if expected is None or delivered is None:
        return None

    return (delivered.date() - expected.date()).days


def format_datetime(value: datetime | None) -> str:
    if value is None:
        return ""
    return value.isoformat()


if __name__ == "__main__":
    main()
