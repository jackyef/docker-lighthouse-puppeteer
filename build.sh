set -ex

echo "Building lighthouse-puppeteer-custom docker image..."
chmod +x ./docker
chmod +x ./docker/*
GIT=`git rev-parse HEAD`
GIT_SHORT=`git rev-parse --short HEAD`
LIGHTHOUSE_VERSION=`cat lighthouse-version`
WRAPPER_VERSION=`cat version`
IMAGE_VERSION=$LIGHTHOUSE_VERSION-$WRAPPER_VERSION

docker build \
    --file ./DockerFile \
    --label commit=$GIT \
    --label commit_short=$GIT_SHORT \
    --tag lighthouse-puppeteer-custom:latest \
    .

docker build \
    --file ./DockerFile \
    --label commit=$GIT \
    --label commit_short=$GIT_SHORT \
    --tag jackyef/lighthouse-puppeteer-custom:latest \
    .

docker build \
    --file ./DockerFile \
    --label commit=$GIT \
    --label commit_short=$GIT_SHORT \
    --tag jackyef/lighthouse-puppeteer-custom:$IMAGE_VERSION \
    .

docker push jackyef/lighthouse-puppeteer-custom:latest
docker push jackyef/lighthouse-puppeteer-custom:$IMAGE_VERSION

echo "✅ All done!"
