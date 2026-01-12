FROM ubuntu:24.04

ARG DEBIAN_FRONTEND=noninteractive

# Configure faster Ubuntu mirror (optional)
RUN sed -i "s|http://archive.ubuntu.com|http://cn.archive.ubuntu.com/ubuntu|g" /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null || \
    sed -i "s|http://archive.ubuntu.com|http://cn.archive.ubuntu.com/ubuntu|g" /etc/apt/sources.list 2>/dev/null || \
    true

# Install core packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl ca-certificates gnupg lsb-release git sudo build-essential \
      python3 python3-pip python3-venv \
      openssh-client openssh-server && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /var/run/sshd

# Ensure theres a non-root user named dev with UID/GID 1000.
# This avoids permission issues on bind-mounted workspaces where files often appear as 1000:1000.
RUN set -eux; \
    if id -u ubuntu >/dev/null 2>&1; then \
      if id -u dev >/dev/null 2>&1; then \
        userdel -r dev || true; \
        groupdel dev || true; \
      fi; \
      groupmod -n dev ubuntu || true; \
      usermod -l dev ubuntu; \
      usermod -d /home/dev -m dev; \
    else \
      if ! id -u dev >/dev/null 2>&1; then \
        groupadd -g 1000 dev || true; \
        useradd -u 1000 -g 1000 -ms /bin/bash dev; \
      else \
        usermod -u 1000 dev || true; \
        groupmod -g 1000 dev || true; \
      fi; \
    fi; \
    echo "dev ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/dev; \
    chmod 0440 /etc/sudoers.d/dev

WORKDIR /home/dev
USER dev

# Install nvm, latest node, and global packages
ENV NVM_DIR=/home/dev/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install node && \
    nvm use node && \
    npm install -g @anthropic-ai/claude-code opencode-ai

CMD ["/bin/bash"]
