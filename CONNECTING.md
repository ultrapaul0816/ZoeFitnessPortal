Open an SSH client.

Locate your private key file. The key used to launch this instance is shubhamg-macbook.pem

Run this command, if necessary, to ensure your key is not publicly viewable.
chmod 400 "shubhamg-macbook.pem"

Connect to your instance using its Public DNS:
ec2-3-6-87-56.ap-south-1.compute.amazonaws.com

Example:

ssh -i "shubhamg-macbook.pem" ubuntu@ec2-3-6-87-56.ap-south-1.compute.amazonaws.com