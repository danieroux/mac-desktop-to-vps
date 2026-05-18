label := "com.danieroux.inbox-reminders"
plist := "~/Library/LaunchAgents/" + label + ".plist"

install:
    cp com.danieroux.inbox-reminders.plist ~/Library/LaunchAgents/
    launchctl load {{plist}}

status:
    launchctl list | grep {{label}}

restart:
    launchctl kickstart -k gui/$(id -u)/{{label}}

tail-log:
    tail -f ~/Library/Logs/inbox-reminders.log
