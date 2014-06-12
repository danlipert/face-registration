This is a system for face registration.  It is in-progress.

To install requirements on Debian,

    sudo apt-get install python-pil python-pyramid

Then run,

    ./run.sh

There is a hardcoded path in run.sh which you will need to change.
Change the path to point to the directory containing the images that you
want to perform face registration on.  Then browse to:

    http://localhost:8080/image/0

Use -o option on face.run in run.sh to output .meta files to the same directory as the images.