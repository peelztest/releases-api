source ~/.powerlevel10k/powerlevel10k.zsh-theme

() {

# Make $terminfo available
zmodload -i zsh/terminfo

# The default zsh keymap is $EDITOR dependent. This forces it to emacs.
# NOTE: this has to be done as early as possible because `bindkey` defaults
# to the current keymap.
bindkey -e

# GNU colors {{{
alias ls="ls --color=auto"
alias grep="grep --color=auto"

local _LS_COLORS=(
  # reset to normal
  'rs=0'
  # normal text
  'no=0'
  # file
  'fi=0'
  # directory
  'di=0;38;2;97;175;239'
  # executable
  'ex=0;38;2;166;226;46'
  # other-writable
  'ow=44;30'
  # block device
  'bd=0;38;2;189;147;249'
  # character device
  'cd=0;38;2;189;147;249'
  # fifo
  'pi=0;38;2;189;147;249'
  # socket
  'so=0;38;2;189;147;249'
  # door (a Solaris thing)
  'do=0;38;2;189;147;249'
  # symlink
  'ln=0;38;2;255;184;108'
  # hard link?
  'mh=0'
  # setuid/setgid
  'su=0;38;2;241;250;140;48;2;255;121;198'
  'sg=0;38;2;241;250;140;48;2;255;121;198'
  # sticky
  'st=0;38;2;241;250;140;48;2;139;233;253'
  # sticky (other writable)
  'tw=0;38;2;241;250;140;48;2;80;250;123'
  # missing symlink target
  'mi=0;38;2;255;85;85;48;2;40;42;54'
  # broken symlink
  'or=1;38;2;236;239;244;48;2;191;97;106'
  # file with capabilities
  'ca=1;38;2;189;147;249'
)
export LS_COLORS="${(j.:.)_LS_COLORS}"

alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
alias diff='diff --color=auto'

# XXX: completion breaks if this is set as an alias
ip() { command ip --color=auto "$@"; }

export LESS_TERMCAP_mb=$'\E[1;31m'     # begin blink
export LESS_TERMCAP_md=$'\E[1;36m'     # begin bold
export LESS_TERMCAP_me=$'\E[0m'        # reset bold/blink
export LESS_TERMCAP_so=$'\E[01;33m'    # begin reverse video
export LESS_TERMCAP_se=$'\E[0m'        # reset reverse video
export LESS_TERMCAP_us=$'\E[1;32m'     # begin underline
export LESS_TERMCAP_ue=$'\E[0m'        # reset underline

# Files and process completion colors
zstyle ':completion:*' list-colors "$LS_COLORS"
zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#) ([0-9a-z-]#)*=01;34=0=01'
# }}}

# Aliases {{{
alias vim='nvim'
alias vi='nvim'
alias fd="fdfind"
# }}}

# History settings {{{
HISTFILE="$HOME/.zsh_history"
HISTSIZE=10000
SAVEHIST=10000
# Allow multiple sessions to append to one history
setopt append_history
# Disable history bangs
unsetopt bang_hist
# Write history in :start:elasped;command format
setopt extended_history
# Eliminate duplicates first when trimming history
setopt hist_expire_dups_first
# When searching history, don't repeat duplicates
setopt hist_find_no_dups
# Ignore duplicate entries
setopt hist_ignore_dups
# Prefix command with a space to prevent it from being recorded
setopt hist_ignore_space
# Remove extra blanks from each command added to history
setopt hist_reduce_blanks
# Don't execute immediately upon history expansion
setopt hist_verify
# Write to history file immediately, not when shell quits
setopt inc_append_history
# Share history with other sessions
setopt share_history
# }}}

# Completion {{{
# Menu selection
zmodload -i zsh/complist
zstyle ':completion:*' menu select

# Enable completion for commands prefixed with `sudo`
zstyle ':completion:*:sudo:*' command-path "${(s|:|)PATH}"

# Enable automatic discovery of new programs in $PATH
# NOTE: can degrade performance of the shell
zstyle ':completion:*' rehash true

# Don't autoselect the first completion entry
unsetopt menu_complete

# Show completion menu on succesive tab presses
setopt auto_menu

# Completion always takes place at the cursor position in the word
setopt complete_in_word

# Case/hyphen insensitive
zstyle ':completion:*' matcher-list '' 'm:{a-zA-Z-_}={A-Za-z_-}' 'r:|=*' 'l:|=* r:|=*'

# Complete . and .. special directories
zstyle ':completion:*' special-dirs true

# Process completion
zstyle ':completion:*:*:*:*:processes' command "ps -u $USERNAME -o pid,user,comm -w -w"

# Disable named-directories autocompletion
zstyle ':completion:*:cd:*' tag-order local-directories directory-stack path-directories

# Use caching so that commands like apt and dpkg complete are useable
zstyle ':completion:*' use-cache yes
zstyle ':completion:*' cache-path $ZSH_CACHE_DIR

# Don't complete uninteresting users
zstyle ':completion:*:*:*:users' ignored-patterns \
  adm amanda apache at avahi avahi-autoipd beaglidx bin cacti canna \
  clamav daemon dbus distcache dnsmasq dovecot fax ftp games gdm \
  gkrellmd gopher hacluster haldaemon halt hsqldb ident junkbust kdm \
  ldap lp mail mailman mailnull man messagebus  mldonkey mysql nagios \
  named netdump news nfsnobody nobody nscd ntp nut nx obsrun openvpn \
  operator pcap polkitd postfix postgres privoxy pulse pvm quagga radvd \
  rpc rpcuser rpm rtkit scard shutdown squid sshd statd svn sync tftp \
  usbmux uucp vcsa wwwrun xfs backup gnats irc list proxy sys \
  www-data '_*' 'systemd-*'
# ... unless we really want to.
zstyle '*' single-ignored show

# These "eat" the auto prior space after a tab complete
ZLE_REMOVE_SUFFIX_CHARS=$' \t\n;&'

bindkey -M menuselect "${terminfo[kcbt]}" reverse-menu-complete

# Load compinit {{{
autoload -Uz compinit
compinit
# }}}

# Add ~/.zfunc to the fpath {{{
[[ ! -d "$HOME/.zfunc" ]] && mkdir -p "$HOME/.zfunc"
fpath+="$HOME/.zfunc"
# }}}

# nvm (Node Version Manager) {{{
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
# }}}

autoload -Uz compinit && compinit
autoload -U bashcompinit && bashcompinit
# }}}

# Fuzzy up/down completion {{{
autoload -Uz up-line-or-beginning-search
autoload -Uz down-line-or-beginning-search
zle -N up-line-or-beginning-search
zle -N down-line-or-beginning-search

bindkey "${terminfo[kcuu1]}" up-line-or-beginning-search
bindkey "${terminfo[kcud1]}" down-line-or-beginning-search
# }}}

# Directory history {{{
setopt auto_pushd
setopt pushd_ignore_dups
setopt pushdminus
# }}}

# Mappings {{{
# Make sure that the terminal is in application mode when zle is active, since
# only then values from $terminfo are valid
if (( ${+terminfo[smkx]} )) && (( ${+terminfo[rmkx]} )); then
  zle-line-init() {
    echoti smkx
  }
  zle-line-finish() {
    echoti rmkx
  }
  zle -N zle-line-init
  zle -N zle-line-finish
fi

# Skips over words using ctrl-left/right
bindkey '\e[1;5D' backward-word
bindkey '\e[1;5C' forward-word
# History search
bindkey '^p' history-search-backward
bindkey '^n' history-search-forward
# }}}

# Plugins {{{
source ~/.zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
ZSH_HIGHLIGHT_STYLES[comment]="fg=#8d94b0"
# }}}

}

[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
