#!/usr/bin/env bash
#set -o errexit # set -e
set -o pipefail
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_file=$(basename "$0")

from_bucket=$1
to_bucket=$2

usage() {
  echo "Usage; ${script_file} [from-bucket-dir-name] [to-bucket-dir-name]
  e.g. ${script_file} moocho-test moocho-predev
"
  exit 1
}

[[ -z "$from_bucket" ]] && usage
[[ -z "$to_bucket" ]] && usage

cd "${script_dir}" || exit 1

set -x
cat ./tmp/wanted-objects | while IFS= read -r object
do
  mkdir -p "$(dirname "buckets/${to_bucket}/${object}")"
  cp "buckets/${from_bucket}/${object}" "buckets/${to_bucket}/${object}"
done