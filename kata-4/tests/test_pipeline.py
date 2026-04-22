import unittest
from decimal import Decimal

from kata_4_loader import pipeline


class PipelineTests(unittest.TestCase):
    def test_parse_date_accepts_multiple_formats(self) -> None:
        self.assertEqual(pipeline.parse_date("11/01/2025").strftime("%Y-%m-%d"), "2025-01-11")
        self.assertEqual(pipeline.parse_date("2025-01-11").strftime("%Y-%m-%d"), "2025-01-11")
        self.assertEqual(str(pipeline.parse_date("1736553600").date()), "2025-01-11")

    def test_parse_decimal_normalizes_brazilian_and_international_formats(self) -> None:
        self.assertEqual(pipeline.parse_decimal("1.540,00"), Decimal("1540.00"))
        self.assertEqual(pipeline.parse_decimal("980.90"), Decimal("980.90"))

    def test_normalize_city_removes_case_and_accents(self) -> None:
        self.assertEqual(pipeline.normalize_city("São Paulo"), "Sao Paulo")
        self.assertEqual(pipeline.normalize_city("sao paulo"), "Sao Paulo")
        self.assertEqual(pipeline.normalize_city("SAO PAULO"), "Sao Paulo")

    def test_compute_delay_days_handles_pending_delivery(self) -> None:
        expected = pipeline.parse_date("2025-01-20")
        self.assertIsNone(pipeline.compute_delay_days(expected, None))


if __name__ == "__main__":
    unittest.main()
