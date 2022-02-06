FROM mongo:5

WORKDIR /opt/backup

RUN apt update && apt install unzip wget \
	&& wget https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -O awscliv2.zip \
	&& unzip awscliv2.zip \
	&& ./aws/install \
	&& rm awscliv2.zip \
	&& rm -r ./aws \
	&& apt clean

COPY entrypoint.sh ./entrypoint.sh

ENTRYPOINT ./entrypoint.sh
CMD []