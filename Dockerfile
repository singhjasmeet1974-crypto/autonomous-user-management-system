# Dockerfile for Automated Linux User Management Testing
# Base: Ubuntu 22.04 LTS (Enterprise Linux Standard)
FROM ubuntu:22.04

# Prevent interactive tzdata and debconf prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install essential Linux administration utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    passwd \
    login \
    coreutils \
    tar \
    gzip \
    grep \
    gawk \
    bsdutils \
    util-linux \
    procps \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy application files
COPY . /app/

# Ensure executable permissions
RUN chmod +x /app/user_management.sh /app/tests/*.sh

# Default command: launch interactive user management
CMD ["/bin/bash", "./user_management.sh"]
