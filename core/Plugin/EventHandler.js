export default function EventHandler(event) {
    return function (target, method, descriptor) {
        if (!event) {
            event = method;
        }
        if (!target.startevents) {
            target.startevents = [];
        }

        let events = target.startevents.slice();
        events.push({"event": event, "func": descriptor.value});
        target.startevents = events;
    };
}