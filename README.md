# usage:

## `needle`

only show result containing `needle`

## `-needle`

only show result not containing `needle` (has priority over positive query terms)

## `~needle`

only show results matching at least one of the several ~needle tokens (eg `~a ~b` will search content contening `a` or `b`)

## `"needle in haystack"`

search `needle in haystack`, allow to search terms containg whitespace or other search operator (-/:) without conflict

## `criteria:term`

search term on a given criteria, possible criteria are:

- `bookmark`: number of times story has been bookmarked
- `bookmarks`: see `bookmark`
- `c`: see `char`
- `chapter`: number of chapters
- `chapters`: see `chapter`
- `char`: this character is in the story
- `comment`: number of comments on the story
- `comments`: see `comment`
- `f`: see `fandom`
- `fandom`: the particular show, movie, book, or other thing the fanfiction is about.
- `hit`: number of hits the story has received
- `hits`: see `hit`
- `kudo`: number of kudo the story has received
- `kudos`: see `kudo`
- `is`: search characteristic of story, current possibilities: `complete`, `crossover`, `ongoing`, categories `f/f`, `f/m`, `gen`, `m/m`, `multi`, `other`, and ratings n/g/t/m/e for respectively not rated/general/teen and up/mature/explicit.
- `lang`: language of the story (eg. lang:english)
- `pair`: this pairing is in the story, each searched character of a pairing must be separated by a / character, - in front of a character so he is not in the pairing
- `tag`: search in the tags
- `u`: see `updated`
- `updated`: time when last updated
- `w`: see `word`
- `word`: number of words in the story
- `words`: see `word`

## `:>quantified` and `:<quantified`

for some criterias (`bookmark`, `chapter`, `comment`, `hit`, `kudo`, `pair`, `updated`, `word`) the term can be quantified more specifically, for example:

- `updated:<3month` will search stories updated since 3 months ago
- `kudo:>4000` will search stories with more than 4000 kudos
- `words:>4242 words:<8585` will search for stories between 4243 and 8584 words
- `pair:3` search pairing with 3 characters


for date type (updated), a quantifier can be used at the end:

- `y`, `year`, `years`: will be a number of year
- `m`, `month`, `months`: will be a number of month
- `w`, `week`, `weeks`: will be a number of week
- `d`, `day`, `days`: will be a number of day

with only a number, the default meaning is a number of days (eg. p:>200days is the same that p:>200)
