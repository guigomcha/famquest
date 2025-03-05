FROM ghcr.io/guigomcha/proxy/alpine:latest

WORKDIR /

# Install kubectl
RUN apk add --no-cache curl bash && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

RUN curl "https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh" -o dropbox_uploader.sh

COPY components/backup-manager/tools/*.sh .

RUN chmod +x *.sh