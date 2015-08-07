export default function EventHandler(event) {
    return function (target, method, descriptor) {
        if (!event) {
            event = method;
        }
        if (!target.startevents) {
            target.startevents = [];
        }

        target.startevents.push({"event": event, "func": descriptor.value});
    }
}