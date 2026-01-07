FROM ubuntu:24.04

ARG DEBIAN_FRONTEND=noninteractive

# Configure faster Ubuntu mirror (Cloudflare CDN)
RUN sed -i 's|http://archive.ubuntu.com|http://cn.archive.ubuntu.com/ubuntu|g' /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null || \
    sed -i 's|http://archive.ubuntu.com|http://cn.archive.ubuntu.com/ubuntu|g' /etc/apt/sources.list 2>/dev/null || \
    true

# Install core packages: curl, ca-certificates, git, sudo, build-essential
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg lsb-release git sudo build-essential \
    python3 python3-pip python3-venv \
    ca-certificates nodejs npm openssh-server && \
    npm install -g @anthropic-ai/claude-code && \
    mkdir /var/run/sshd

# Create a non-root user 'dev' for convenience
RUN useradd -ms /bin/bash dev && \
    echo "dev ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/dev

WORKDIR /home/dev
USER dev



# Default shell
CMD ["/bin/bash"]