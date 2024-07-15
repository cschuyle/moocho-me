#!/usr/bin/env bash
#set -o errexit # set -e
set -o pipefail
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_file=$(basename "$0")
project_dir="$( cd "${script_dir}" && pwd )"

from_local_bucket_dir=$1
to_actual_bucket=$2

error() {
  local sourcefile=$1
  local lineno=$2
  # ...logic for reporting an error at line $lineno
  # of file $sourcefile goes here...
}
trap 'error "${BASH_SOURCE}" "${LINENO}"' ERR


usage() {
  echo "Usage: $script_file [local bucket dir in ${script_dir}/buckets] [bucket name in currently-logged-into AWS]
  e.g. ./${script_file} moocho-predev moocho-dev
"
  exit 1
}
[[ -z "${AWS_ENDPOINT_URL}" ]] && echo "You must set AWS_ENDPOINT_URL to the local Minio URL -- see ${project_dir}/envrc-template" && exit 1

[[ -z "${from_local_bucket_dir}" ]]  && usage
[[ ! -d "${script_dir}/buckets/${from_local_bucket_dir}" ]] && echo "Invalid from_local_bucket_dir name - must be a directory in ${script_dir}/buckets" && exit 1

[[ -z "${to_actual_bucket}" ]]  && echo usage

echo "Will copy recursively ${script_dir}/buckets/${from_local_bucket_dir} to ${AWS_ENDPOINT_URL}"

create-bucket() {
  if [[ -z "$( (aws s3 ls ${from_local_bucket_dir} 2>&1) > /dev/null)" ]]
  then
    aws s3api create-bucket --bucket "${from_local_bucket_dir}"
  fi
}

create-bucket "$from_local_bucket_dir"

cd "${script_dir}/buckets/${from_local_bucket_dir}" || exit 2
find . -type f -print0 | while IFS= read -r -d '' file
do
    file_no_dot=${file:2}
    echo "WILL COPY: $file to BUCKET $to_actual_bucket, OBJECT: $file_no_dot"
    aws s3 cp "$file" "s3://${to_actual_bucket}/$file_no_dot"
done

