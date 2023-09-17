template:

    docker run -v host/path/to/openapispec:cont/path/to/openapispec schemathesis/schemathesis:stable run cont/path/to/openapispec --base-url=http://service_url:port

impl:

    docker run -v ${PWD}:/reports -v ${PWD}\..\..\docs:/docs schemathesis/schemathesis:stable run /docs/OAS.json --base-url=http://host.docker.internal:6000 > schemathesis/schemathesisreport.txt