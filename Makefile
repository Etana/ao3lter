extension.zip:	e.js manifest.json i.png
	rm -f $@
	7z -mx=9 a $@ e.js manifest.json i.png


clean:
	rm -f extension.zip
