FROM golang:1.17.3

ENV terraform_version=v1.0.11

RUN git clone https://github.com/hashicorp/terraform.git -b $terraform_version /tmp/terraform && \
    cd /tmp/terraform && \
    go build -o /usr/local/bin && \
    chmod +x /usr/local/bin/terraform
