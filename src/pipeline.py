import argparse

from src.config import OUTPUT_DIR


def run_load():
    """Stage 1: Carga y limpieza de CSVs."""
    from src.data.load import load_all_reports
    from src.data.clean import clean_trap_data

    print("=" * 50)
    print("STAGE: load")
    print("=" * 50)
    raw = load_all_reports()
    clean = clean_trap_data(raw)
    return clean


def run_geocode():
    """Stage 2: Geocodificación de localidades."""
    import pandas as pd
    from src.geocoding.geocode import geocode_all

    print("=" * 50)
    print("STAGE: geocode")
    print("=" * 50)
    trap_path = OUTPUT_DIR / "trap_data_clean.csv"
    if not trap_path.exists():
        print("Ejecutando stage 'load' primero...")
        run_load()

    trap_df = pd.read_csv(trap_path)
    geocode_all(trap_df)


def run_weather():
    """Stage 3: Descarga de datos climáticos (se ejecuta como parte de assemble)."""
    print("=" * 50)
    print("STAGE: weather")
    print("=" * 50)
    print("Los datos climáticos se descargan durante el stage 'assemble'.")
    print("Ejecutá: python -m src.pipeline --stage assemble")


def run_assemble():
    """Stage 4: Ensamblado del dataset final."""
    import pandas as pd
    from src.features.assemble import build_dataset
    from src.config import GEOCODING_CACHE

    print("=" * 50)
    print("STAGE: assemble")
    print("=" * 50)

    trap_path = OUTPUT_DIR / "trap_data_clean.csv"
    if not trap_path.exists():
        print("Ejecutando stage 'load' primero...")
        run_load()

    if not GEOCODING_CACHE.exists():
        print("Ejecutando stage 'geocode' primero...")
        run_geocode()

    trap_df = pd.read_csv(trap_path)
    build_dataset(trap_df)


STAGES = {
    "load": run_load,
    "geocode": run_geocode,
    "weather": run_weather,
    "assemble": run_assemble,
}


def main():
    parser = argparse.ArgumentParser(description="ChicharritAI Pipeline")
    parser.add_argument(
        "--stage",
        choices=list(STAGES.keys()),
        help="Stage a ejecutar. Sin argumento, corre todo.",
    )
    args = parser.parse_args()

    if args.stage:
        STAGES[args.stage]()
    else:
        run_load()
        run_geocode()
        run_assemble()

    print("\nPipeline completado.")


if __name__ == "__main__":
    main()
