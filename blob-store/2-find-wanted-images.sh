#!/usr/bin/env bash
#set -o errexit # set -e
set -o pipefail
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_file=$(basename "$0")
project_dir="$( cd "${script_dir}" && pwd )"

bucket=$1

error() {
local sourcefile=$1
local lineno=$2
# ...logic for reporting an error at line $lineno
# of file $sourcefile goes here...
}
trap 'error "${BASH_SOURCE}" "${LINENO}"' ERR

[[ -z "${AWS_ENDPOINT_URL}" ]] && echo "You must set AWS_ENDPOINT_URL to the local Minio URL -- see ${project_dir}/envrc-template" && exit 1

[[ -z "${bucket}" ]]  && echo "Usage: $script_file [bucket name]" && exit 1

[[ ! -d "${script_dir}/buckets/${bucket}" ]] && echo "Invalid bucket name - must be a directory in ${script_dir}/buckets" && exit 1

cd "${script_dir}"

mkdir -p tmp

# The list of everything in the dir - I want only some of these.
(cd "buckets/${bucket}" ; find . -type f) \
| perl -pe 's/^.{2}//' \
> tmp/all-objects

# Small Images
cat "buckets/${bucket}/public/little-prince-wanted" \
| jq -r '.items.[].littlePrinceItem.smallImageUrl' \
> tmp/small-image-urls

# Large Images
cat "buckets/${bucket}/public/little-prince-wanted" \
| jq -r '.items.[].littlePrinceItem.largeImageUrl' \
> tmp/large-image-urls

cd tmp

cat large-image-urls small-image-urls \
| perl -pe 's/https:\/\/moocho-test.s3-us-west-2.amazonaws.com\/(.*(png|jpg|jpeg|gif|webp))$/\1/' \
| sort | uniq \
> wanted-objects

# This was when I thought I needed the intersection. All I actually need is to copy over the wanted files from the original trove (not predev).
#
#perl -ne 'BEGIN{ $h{$_}=1 while <STDIN> } print if $h{$_}' < wanted-objects all-objects | sort > intersection-sorted
#echo "intersection of tmp/wanted-objects-uniq and tmp/all-objects --> tmp/intersection-sorted"

