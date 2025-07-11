class Booking {
    constructor(id, userId, roomId, startTime, endTime) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

module.exports = Booking; 