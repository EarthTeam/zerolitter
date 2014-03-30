#! /usr/bin/env bash
# vim: set ft=shell

default:
	SHELL = /bin/bash
	apt-get update; 
	apt-get install -y git curl;
	git clone https://github.com/npm/npm.git;
	cd npm; make install;

	source ~/.nvm/nvm.sh
	nvm use 0.10.26
	npm install
	bower install

redis:
	curl -O http://download.redis.io/releases/redis-2.8.8.tar.gz
	tar xzf redis-2.8.8.tar.gz
	cd redis-2.8.8; $(MAKE)