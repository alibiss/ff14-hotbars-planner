# FF14 Hotbars Planner

I always wanted to give this one idea a try because it's simple enough (in theory) and I also recently found out about the `draggable` attribute which led me to start this pain in the ass of the project. I spent more time designing my scraper scripts than actually implementing the drag and drop handlers.

Features:
- Lame drag and drop icons using HTML
- Swapping icon locations on the same hotbar
- ???

# Who asked?

### Aren't you reinventing the [*wheel*](https://xivbars.bejezus.com) ?
I found out about that when I was basically half done with my Node scrapers..

### Why not using XIVAPI instead of scraping from different websites?
Elastic Search is super convoluted to me. Coming up with the correct filters to bring down the amount of false positives under 100 items per requests took too much time and effort.

I'm also pretty proud of the looping promises I came up with to keep the amount of requests per seconds to a minimum. My IP didn't get rate limited even once!

---

<sup>The totality of the images cached on this repo are of course property of [SQUARE ENIX CO., LTD.](http://support.na.square-enix.com/rule.php?id=5382&la=1&tag=authc)</sup>