express for server 
openapi for documentation in spec first fashion (code first fashion is not possible with express)
axios for http requests (instead of fetch)
keep curator route names consistent with other services' routes they must be the same 
validation is a middleware reason: it is a cross cutting concern and it is not a business logic
keeping routes in env variables -> easy to config outside the process -> next step is to keep them in a configmap in k8s