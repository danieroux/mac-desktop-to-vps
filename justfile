label := "com.danieroux.inbox-reminders"
plist := "~/Library/LaunchAgents/" + label + ".plist"

install:
    cp com.danieroux.inbox-reminders.plist ~/Library/LaunchAgents/
    launchctl load {{ plist }}

status:
    launchctl list | grep {{ label }}

restart:
    launchctl kickstart -k gui/$(id -u)/{{ label }}

tail-log:
    tail -f ~/Library/Logs/inbox-reminders.log

run-browser-for-arthur:
    #!/bin/bash
    echo "Running socat so that remote can access it"
    socat TCP-LISTEN:9223,bind=0.0.0.0,fork TCP:127.0.0.1:9222 &
    SOCAT_PID=$!
    trap "kill $SOCAT_PID" EXIT
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --profile-directory="AssistantArthur" \
      --user-data-dir=/Users/danie/src/mac-desktop-to-vps/AssistantArthurProfile \
      --remote-debugging-port=9222 \
      --remote-allow-origins=*

# Adds Chrome as an exception on the firewall
enable-browser-for-arthur:
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
