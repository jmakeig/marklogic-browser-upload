#!/usr/bin/env bash

# Usage: cat template.js | ./generate-actions.sh
# TODO: Figure out how to parameterize the “nouns” and “verbs”

sed 's#\$Noun#Files#g' | sed 's#\$NOUN#FILES#g' | sed 's#\$Verb#Upload#g' | sed 's#\$verb#upload#g' | sed 's#\$VERB#UPLOAD#g'
