#! /bin/sh

# UNFINISHED PSEUDOCODE:
# curl dsbs.tar.gz
tar -C foia/dump  -zxvf dsbs_foia.tar.gz
node foia/tasks/import.js