
print('Creating collection Articles');

function asIso(prefix, suffix, minute) {
	let minuteString = '' + (minute + 1);
	if (minuteString.length === 1) {
		minuteString = '0' + minuteString;
	}
	return prefix + minuteString + suffix;
}

function pad2(value) {
	if (value < 10) {
		return '0' + value;
	}
	return value;
}

db.articles.insert({
	title: 'Test Article 1',
	id: 'test-article',
	published: true,
	created: '2020-01-20T10:00:01Z',
	updated: "2020-05-01T13:00:00Z",
	content: '# A very cool test article\n<preview>Once upon a time...</preview>\nOther content',
	tags: ["Java", "Scala"],
	atomId: "b93f90f8-d3ca-480b-a71f-6ea3fda35004"
});
db.articles.insert({
	title: 'Test Article 2',
	id: 'another-test-article',
	published: false,
	created: '2020-01-22T14:00:01Z',
	updated: "2020-05-01T14:00:00Z",
	content: 'Another very cool test article',
	tags: [],
	atomId: "8f855752-23a6-4af5-b434-31b9aeda4b6c"
});
Array(40).fill().forEach((_, i) => {
	db.articles.insert({
		title: 'Test Article ' + (i + 3),
		id: 'test-article-' + (i + 3),
		published: i % 3 !== 0,
		created: asIso('2020-01-20T01:', ':01Z', (i + 1)),
		updated: asIso('2020-05-02T01:', ':01Z', (i + 1)),
		content: '<preview>A very cool test article</preview>',
		tags: ["Java", "Scala"],
		atomId: "c33f90f8-d3ca-480b-a71f-6ea3fda350" + pad2(i + 1)
	});
});
db.articles.insert({
	title: 'Last Test Article',
	id: 'last-test-article',
	published: false,
	created: '2020-01-22T14:00:01Z',
	updated: "2020-05-01T12:00:00Z",
	content: '# Another very cool test article\n<preview>Preview going ahead...</preview>\nSomething something',
	tags: [],
	atomId: "fe72f0f5-9c71-445b-a9e9-ddc133958130"
});
print('Created collection Articles');