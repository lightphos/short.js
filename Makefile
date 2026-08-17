.PHONY: cmp

all:
	npx http-server . -p 3000 --cors -c-1

twi:
	npm install tailwindcss @tailwindcss/cli

tw:
	npx @tailwindcss/cli -i ./style-i.css -o ./style-o.css --watch

cmp.%:
	npm run build -- eg/$*.jsx
