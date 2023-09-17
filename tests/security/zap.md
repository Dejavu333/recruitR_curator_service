template:

    docker run -v report/will/be:/zap/wrk -t owasp/zap2docker-stable zap-full-scan.py -t http://service_url:port -r report.html

impl:

    docker run -v ${PWD}:/zap/wrk -t owasp/zap2docker-stable zap-full-scan.py -t http://host.docker.internal:6000 -J zapreport.json

- Baseline Scan which runs the ZAP spider against the target for (by default) 1 minute followed by an optional ajax spider scan before reporting the results of the passive scanning.

- Full Scan which runs the ZAP spider against the target (by default with no time limit) followed by an optional ajax spider scan and then a full active scan before reporting the results.

- API Scan which performs an active scan against APIs defined by OpenAPI, or GraphQL (post 2.9.0) via either a local file or a URL.

options:

    -r report_html    file to write the full ZAP HTML report
    -w report_md      file to write the full ZAP Wiki(Markdown) report
    -x report_xml     file to write the full ZAP XML report
    -J report_json    file to write the full ZAP JSON document