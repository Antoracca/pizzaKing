 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..6cae8be6fae732120c46a31cb1e0dba7fc627245
--- /dev/null
+++ b/README.md
@@ -0,0 +1,54 @@
+# Pizza King
+
+Monorepo de la plateforme digitale **Pizza King** (web, mobile, Firebase Functions et packages partagés).
+
+## Contenu du projet
+
+- `apps/web` : application web Next.js.
+- `apps/mobile` : application mobile Expo/React Native.
+- `functions` : Firebase Cloud Functions.
+- `packages/shared` : types, constantes et utilitaires partagés.
+- `packages/firebase-config` : configuration Firebase mutualisée.
+
+## Prérequis
+
+- Node.js `20.x`
+- pnpm `>=9`
+
+## Installation
+
+```bash
+pnpm install
+```
+
+## Commandes utiles
+
+```bash
+# Lancer les apps en développement
+pnpm dev
+
+# Lancer uniquement le web
+pnpm dev:web
+
+# Lancer uniquement le mobile
+pnpm dev:mobile
+
+# Lancer les functions
+pnpm dev:functions
+
+# Linter les apps
+pnpm lint
+
+# Construire les apps
+pnpm build
+```
+
+## Documentation existante
+
+Des README détaillés existent déjà dans plusieurs sous-projets :
+
+- `apps/web/README.md`
+- `apps/mobile/README.md`
+- `functions/README.md`
+- `packages/shared/README.md`
+- `packages/firebase-config/README.md`
 
EOF
)
