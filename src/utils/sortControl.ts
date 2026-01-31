const ALLOWED_STATUSES = ["Approved", "Denied", "Awaiting approval"];
const ALLOWED_TYPES = [
  "Blackening",
  "Kidud",
  "Let me in",
  "Let me in by car or plane",
  "Sign for me"
];

const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const sortControl = (query: any) => {
  let match: any = {};
  let sort: any = {};

  if (query.status) {
    if (ALLOWED_STATUSES.includes(query.status)) {
      match.status = query.status;
    } else {
      throw new Error("Not a valid status.");
    }
  }

  if (query.type) {
    if (ALLOWED_TYPES.includes(query.type)) {
      match.type = query.type;
    } else {
      throw new Error("Not a valid type.");
    }
  }

  if (query.date) {
    if (query.date === "newest") {
      sort.createdAt = -1;
    } else if (query.date === "oldest") {
      sort.createdAt = 1;
    } else {
      throw new Error("Not a valid sorting parameter");
    }
  }

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
