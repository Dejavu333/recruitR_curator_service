# Curator service
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
    - business logic by curating the quiz service and the notifier service