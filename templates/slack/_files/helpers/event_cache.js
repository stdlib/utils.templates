/**
  EventCache(TimeToLive=60000)
    Creates a cache of executed events in a LinkedList

    This is to mitigate duplication of events on a Slack Event timeout from
      the /events function. At scale, we recommend switching to another
      service or tool (like Redis) to handle this. StdLib services are
      not guaranteed to execute in the same container - with high
      request volume, the efficacy of this cache becomes limited.
*/

class EventCache {

  constructor(ttl) {
    this.last = null;
    this.first = null;
    this.cache = {};
    this.ttl = ttl || 60000;
  }

  refresh() {
    let t = new Date().valueOf();
    let cache = this.cache;
    let ttl = this.ttl;
    while (this.first) {
      let first = this.first;
      if (t - first.timestamp > ttl) {
        this.first = first.next;
        first.next = null;
        delete cache[first.id];
      } else {
        break;
      }
    }
    if (!this.first) {
      this.last = this.first = null;
    }
    return cache;
  }

  add(event, id) {
    let cache = this.refresh();
    if (cache[id]) {
      return false;
    }
    let last = this.last;
    cache[id] = this.last = {id: id, timestamp: new Date().valueOf(), next: null};
    last && (last.next = this.last);
    !this.first && (this.first = this.last);
    return this.last;
  }

}

module.exports = EventCache;
