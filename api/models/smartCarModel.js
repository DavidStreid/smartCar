var errors = [
	[200, "OK"],
	[400, "Bad Request"],
	[404, "Vehicle Not Found"],
	[405, "Method Not Allowed"],
	[500, "Internal Server Error"]
]

map = new Map(errors);

moduleexports = map;