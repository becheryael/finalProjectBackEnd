const sortControl = (query: any) => {
  let match: any = {};
  let sort: any = {};

  const allowedStatuses = ["Approved", "Denied", "Awaiting approval"];
  if (query.status && allowedStatuses.includes(query.status)) {
    match.status = query.status;
  }

  const allowedTypes = [
    "Blackening",
    "Kidud",
    "Let me in",
    "Let me in by car or plane",
    "Sign for me"
  ];
  if (query.type && allowedTypes.includes(query.type)) {
    match.type = query.type;
  }

  if (query.date === "newest") sort.createdAt = -1;
  if (query.date === "oldest") sort.createdAt = 1;

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  if (query.startDate && query.endDate) {
    if (
      !isValidDate(query.startDate as string) ||
      !isValidDate(query.endDate as string)
    ) {
      throw new Error("Not a valid date.");
    }
    const start = new Date(query.startDate as string);
    const end = new Date(query.endDate as string);
    if (start > end) {
      throw new Error("start date must be before end date.");
    }
    match.createdAt = {
      $gte: start,
      $lte: end
    };
  }

  return { match, sort };
};

export default sortControl;
