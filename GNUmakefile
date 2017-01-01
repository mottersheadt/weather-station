
start-coauth:
	docker run --name coauth -d -p 2884:80		\
		-v $$(pwd)/db:/var/www/db		\
		-e COAUTH_APIKEY=502fbc82-6bfc-4e47-ad36-a8c23ee7b130 \
		webheroes/coauth
