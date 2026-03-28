import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.inspection import permutation_importance
import shap
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


def main():
    # ========================
    # 1. LOAD
    # ========================
    df = pd.read_csv("output/dataset.csv")
    print(f"Dataset: {len(df)} filas")

    # Columnas metadata vs features
    meta_cols = [
        "localidad", "provincia", "region", "temporada",
        "max_capturas", "mean_capturas", "n_lecturas", "n_detecciones", "target",
    ]
    feature_cols = [c for c in df.columns if c not in meta_cols]
    print(f"Features: {len(feature_cols)}")
    print(f"Target balance: {df['target'].value_counts().to_dict()}")

    X = df[feature_cols]
    y = df["target"]

    # ========================
    # 2. TEMPORAL SPLIT
    # ========================
    train_mask = df["temporada"] == "2024-2025"
    test_mask = df["temporada"] == "2025-2026"

    X_train, y_train = X[train_mask], y[train_mask]
    X_test, y_test = X[test_mask], y[test_mask]
    print(f"\nTrain (2024-2025): {len(X_train)} | Test (2025-2026): {len(X_test)}")

    # ========================
    # 3. MODEL
    # ========================
    n_pos = y_train.sum()
    n_neg = len(y_train) - n_pos
    scale = n_neg / n_pos if n_pos > 0 else 1.0

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.7,
        reg_alpha=1.0,
        reg_lambda=1.0,
        scale_pos_weight=scale,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    # ========================
    # 4. EVALUATION
    # ========================
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba > 0.5).astype(int)

    print("\n" + "=" * 50)
    print("RESULTADOS")
    print("=" * 50)

    if len(y_test.unique()) > 1:
        auc = roc_auc_score(y_test, y_pred_proba)
        print(f"ROC AUC: {auc:.3f}")
    else:
        print("ROC AUC: N/A (solo una clase en test)")

    print(f"\n{classification_report(y_test, y_pred, zero_division=0)}")

    # ========================
    # 5. FEATURE IMPORTANCE (GAIN)
    # ========================
    importance = model.get_booster().get_score(importance_type="gain")
    print("Feature importance (gain):")
    for k, v in sorted(importance.items(), key=lambda x: -x[1])[:10]:
        print(f"  {k}: {v:.4f}")

    # ========================
    # 6. PERMUTATION IMPORTANCE
    # ========================
    scoring = "roc_auc" if len(y_test.unique()) > 1 else "accuracy"
    perm = permutation_importance(
        model, X_test, y_test, n_repeats=10, random_state=42, scoring=scoring
    )
    print(f"\nPermutation importance ({scoring}, test):")
    for i in perm.importances_mean.argsort()[::-1][:10]:
        print(f"  {feature_cols[i]}: {perm.importances_mean[i]:.4f}")

    # ========================
    # 7. SHAP
    # ========================
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)

    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_test, show=False)
    plt.tight_layout()
    plt.savefig("output/shap_summary.png", dpi=150)
    print("\nSHAP summary guardado en output/shap_summary.png")

    # ========================
    # 8. SAVE MODEL
    # ========================
    model.save_model("output/model.json")
    print("Modelo guardado en output/model.json")


if __name__ == "__main__":
    main()
