# curator service
This service would do the following:

    - service discovery (but kubernetes does it for us)
    - load balancing (but kubernetes does it for us)
    - auto-scaling (but kubernetes does it for us)
    - auto-healing (but kubernetes does it for us)
    - rate limiting
    - caching
    - validation
    - authentication by curating the identity provider service
    - authorization by curating the identity provider service
    - monitoring by curating the monitoring service
    - curating the quiz service and the notifier service

For api documentation, please visit swagger editor at http://localhost:80
and paste the content of `./OAS.json` into the editor.
docker run -d -p 80:8080 swaggerapi/swagger-editor