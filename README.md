Lich.js
=======

Lich.js - A Networked Audio / Visual Live Coding Language. 

Copyright © 2012-2014 Chad McKinney. All Rights Reserved.

http://chadmckinneyaudio.com/

chad@chadmckinneyaudio.com


Additional Contributions by


Curtis McKinney -- Networking, Emacs Integration

www.curtismckinney.com

casiosk1@gmail.com
	   


Cole Ingraham -- scsynth ugen bindings, VIM Integration

www.coleingraham.com

coledingraham@gmail.com


Beta
==========

Lich.js is in beta!! You can try it out for yourself by going to:

www.chadmckinneyaudio.com/lich


LICENSE
=======

Licensed under the Simplified BSD License:

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met: 

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies, 
either expressed or implied, of the FreeBSD Project.


USAGE
=====

At the moment Lich.js is not officially released. If you still want to try it out you can get it up and running on your own computer but it will require a little work. There are still bugs, missing features, and essentially no documentation so don't expect a finished product. All that said, here are the instructions to try out Lich.js for yourself.

Lich.js is divided into two parts: a server and a client. To create a server you will first need Node.js installed on your computer. Node can be found here: http://nodejs.org/. If you're on Linux it should likely be in your standard repo, for instance in Ubuntu you can install it with: 
<!--- The ```bash and ``` at the end is for markdown rendering. Please ignore if you're reading this from a text editor or the like. -->
```bash
sudo apt-get install nodejs
```

Next you will need to use npm (node package manager) to install socket.io (a networking library) to the Lich.js local directory. In a unix based system (Linux/OSX) you can use the command line to do this as such:

``` bash
cd /path/to/lich.js
npm install socket.io
```

At this point you have all the dependancies for the server. Now you can just run this from the command line to get the server up (this should be run from the lich.js folder):

```bash
sudo node Networking/LichServer.js
```

Now all that's left is to open up Chrome (Firefox and Safari also work, but not as well) and go to 127.0.0.1 (or if you're doing this on a different computer, say your server, just point your browser at that computer's IP). Once the page has loaded you can test that everything is running by executing this code (use shift-return to execute a line of code) :

<!--- the ```haskell is for markdown rendering such as on GitHub. If you're reading this document via a text editor please ignore the ```haskell and the ``` at the end. -->
```haskell
let testSynth freq => saw freq >> perc 0 0.2 0.3
testPattern ~> testSynth 0 1 2 3 4 5 6 7 | (d2f major)

-- When you've heard enough
stop testPattern
```
