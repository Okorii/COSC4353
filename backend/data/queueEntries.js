const queueEntries = [
    {
      id: "q2",
      petName: "Coco",
      ownerName: "Maria Garcia",
      serviceId: 2,
      joinedAt: new Date().toISOString(),
      status: "WAITING",
    },
    {
      id: "q3",
      petName: "Max",
      ownerName: "Luis Perez",
      serviceId: 1,
      joinedAt: new Date().toISOString(),
      status: "WAITING",
    },
    {
      id: "q1",
      petName: "Luna",
      ownerName: "Billy Jones",
      serviceId: 3,
      joinedAt: new Date().toISOString(),
      status: "WAITING",
    },
  ];
  
  module.exports = queueEntries;