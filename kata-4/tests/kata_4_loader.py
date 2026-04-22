import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


PIPELINE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "pipeline.py"
SPEC = spec_from_file_location("kata4_pipeline", PIPELINE_PATH)

if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Unable to load pipeline module.")

pipeline = module_from_spec(SPEC)
sys.modules[SPEC.name] = pipeline
SPEC.loader.exec_module(pipeline)
