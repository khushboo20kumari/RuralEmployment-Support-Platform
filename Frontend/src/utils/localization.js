// Frontend utility to handle job data translations
// This function formats job data to show the correct language

export const getLocalizedJobData = (job, language = 'en') => {
  if (!job) return null;

  // Create a copy to avoid modifying original
  const localizedJob = { ...job };

  if (language === 'hi') {
    // Use Hindi versions if available, fallback to English
    localizedJob.displayTitle = job.titleHi || job.title;
    localizedJob.displayDescription = job.descriptionHi || job.description;
  } else {
    // Use English versions
    localizedJob.displayTitle = job.title;
    localizedJob.displayDescription = job.description;
  }

  return localizedJob;
};

// Format array of jobs
export const getLocalizedJobs = (jobs = [], language = 'en') => {
  return jobs.map(job => getLocalizedJobData(job, language));
};

// Format workType for display
export const getLocalizedWorkType = (workType, language = 'en') => {
  const workTypeMap = {
    en: {
      construction_labour: 'Construction Labour',
      factory_helper: 'Factory Helper',
      farm_worker: 'Farm Worker',
      domestic_help: 'Domestic Help',
      other: 'Other',
    },
    hi: {
      construction_labour: 'निर्माण मजदूरी',
      factory_helper: 'कारखाना सहायक',
      farm_worker: 'खेत मजदूर',
      domestic_help: 'घरेलू मदद',
      other: 'अन्य',
    },
  };

  return workTypeMap[language]?.[workType] || workType;
};

// Format salary period
export const getLocalizedSalaryPeriod = (period, language = 'en') => {
  const periodMap = {
    en: {
      hourly: 'per hour',
      daily: 'per day',
      monthly: 'per month',
    },
    hi: {
      hourly: 'प्रति घंटा',
      daily: 'प्रति दिन',
      monthly: 'प्रति महीना',
    },
  };

  return periodMap[language]?.[period] || period;
};
