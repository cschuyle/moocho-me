#!/usr/bin/env bash
set -o errexit # set -e
set -o pipefail
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_file=$(basename "$0")
project_dir="$( cd "${script_dir}" && pwd )"

from_bucket=$1
to_bucket_dir=$2

usage() {
    echo "Usage: $script_file [bucket name to download] [directory (under ${script_dir}) to download it to]"
    exit 1
}

[[ -z "${from_bucket}" ]]  && usage
[[ -z "${to_bucket_dir}" ]]  && usage

mkdir -p "${script_dir}/buckets/${to_bucket_dir}"

aws s3 cp "s3://${from_bucket}" "${script_dir}/buckets/${to_bucket_dir}" --recursive

