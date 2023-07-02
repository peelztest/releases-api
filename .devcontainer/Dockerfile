FROM docker.io/library/debian:bookworm
RUN apt-get -y update && apt-get -y upgrade

# Prevent tzdata's interactive prompt from blocking
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install tzdata

# Packages
RUN apt-get -y install locales man-db build-essential sudo git curl zsh nano neovim ripgrep fd-find jq
RUN apt-get -y install libunwind-14 libc++-dev

# Locales
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
RUN locale-gen en_US.UTF-8 UTF-8 && update-locale en_US.UTF-8 UTF-8
RUN echo "LANG=en_US.utf-8" >> /etc/environment \
  && echo "LC_ALL=en_US.utf-8" >> /etc/environment

# Create user
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
RUN useradd -m -G sudo --shell "$(which zsh)" vscode
USER vscode

# Set up zsh config
COPY ./.zshrc /home/vscode/.zshrc
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/.powerlevel10k
COPY ./.p10k.zsh /home/vscode/.p10k.zsh
RUN git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.zsh-syntax-highlighting

# Let p10k do first-time initialization
RUN echo exit | script -qec zsh /dev/null > /dev/null
