const tracks_res = {};
const tracks_num = 10;
const min_time = 20; // conditions: min_time is int > 0 and min_time | 60
const open_hour = 8;
const close_hour = 22;

function initializeDayReservations() {
    const dayReservations = [];
    for (let i = 0; i < tracks_num; i++) {
        const trackReservations = Array((close_hour - open_hour) * (60 / min_time)).fill(0);
        dayReservations.push(trackReservations);
    }
    return dayReservations;
}

function timeToSlot(hour, minute) {
    const total_minutes = (hour * 60) + minute;
    const open_minutes = open_hour * 60;
    return Math.floor((total_minutes - open_minutes) / min_time);
}

function checkAvailability(date_str, start_slot, end_slot, num_tracks) {
    let availableTracks = [];
    for (let track = 0; track < tracks_num; track++) {
        const trackSlots = tracks_res[date_str][track];
        if (trackSlots.slice(start_slot, end_slot).every(slot => slot === 0)) {
            availableTracks.push(track);
            if (availableTracks.length >= num_tracks) {
                return availableTracks;
            }
        }
    }
    return [];
}

function reserveTracks(date_str, start_slot, end_slot, tracks) {
    tracks.forEach(track => {
        for (let slot = start_slot; slot < end_slot; slot++) {
            tracks_res[date_str][track][slot] = 1;
        }
    });
}

function getRes(date_str, bgn_hour, bgn_minute, end_hour, end_minute, num_tracks) {
    const current_datetime = new Date();
    const reservation_datetime = new Date(date_str);
    reservation_datetime.setHours(bgn_hour);
    reservation_datetime.setMinutes(bgn_minute);

    if (reservation_datetime < current_datetime) {
        return [];
    }

    if ((bgn_hour * 60 + bgn_minute) >= (open_hour * 60) &&
        (end_hour * 60 + end_minute) <= (close_hour * 60) &&
        (end_hour * 60 + end_minute) > (bgn_hour * 60 + bgn_minute)) {
        if (bgn_minute % min_time !== 0 || end_minute % min_time !== 0) {
            return [];
        }

        if (!tracks_res[date_str]) {
            tracks_res[date_str] = initializeDayReservations();
        }

        const start_slot = timeToSlot(bgn_hour, bgn_minute);
        const end_slot = timeToSlot(end_hour, end_minute);
        const availableTracks = checkAvailability(date_str, start_slot, end_slot, num_tracks);

        if (availableTracks.length === num_tracks) {
            reserveTracks(date_str, start_slot, end_slot, availableTracks);
            return availableTracks.map(track => track + 1); // Return array of track numbers (1-based index)
        }
    }
    return [];
}

document.getElementById('reservation-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const date = document.getElementById('date').value;
    const bgn_hour = parseInt(document.getElementById('start-hour').value, 10);
    const bgn_minute = parseInt(document.getElementById('start-minute').value, 10);
    const end_hour = parseInt(document.getElementById('end-hour').value, 10);
    const end_minute = parseInt(document.getElementById('end-minute').value, 10);
    const num_tracks = parseInt(document.getElementById('num-tracks').value, 10);
    const messageDiv = document.getElementById('message');

    if (bgn_minute % min_time !== 0 || end_minute % min_time !== 0) {
        messageDiv.textContent = "Minutes must be a multiple of 20.";
        return;
    }

    const reservedTracks = getRes(date, bgn_hour, bgn_minute, end_hour, end_minute, num_tracks);
    if (reservedTracks.length === num_tracks) {
        messageDiv.textContent = `Tracks ${reservedTracks.join(', ')} reserved on ${date} from ${bgn_hour}:${bgn_minute.toString().padStart(2, '0')} to ${end_hour}:${end_minute.toString().padStart(2, '0')}. Thank you!`;
        console.log(tracks_res);
    } else {
        messageDiv.textContent = `Unfortunately, ${num_tracks} tracks are not available for the requested time slot or in the past.`;
    }
});
