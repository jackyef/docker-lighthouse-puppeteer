set -ex

echo "Building lighthouse-puppeteer-custom docker image..."
GIT=`git rev-parse HEAD`
GIT_SHORT=`git rev-parse --short HEAD`

docker build \
    --file ./DockerFile \
    --label commit=$GIT \
    --label commit_short=$GIT_SHORT \
    --tag lighthouse-puppeteer-custom:latest \
    .

# docker build \
#     --file ./DockerFile \
#     --label commit=$GIT \
#     --label commit_short=$GIT_SHORT \
#     --tag jackyef/lighthouse-puppeteer-custom:latest \
#     .

# docker build \
#     --file ./DockerFile \
#     --label commit=$GIT \
#     --label commit_short=$GIT_SHORT \
#     --tag jackyef/lighthouse-puppeteer-custom:$GIT \
#     .

# docker push jackyef/lighthouse-puppeteer-custom:latest
# docker push jackyef/lighthouse-puppeteer-custom:$GIT

echo "✅ All done!"
