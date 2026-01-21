import { FaLinkedin, FaGithub } from 'react-icons/fa';

export default function TeamMember({
  name,
  position,
  photo,
  linkedin,
  github,
  size = 'small',
}) {
  // Adjusted sizes for better fit in single rows
  const sizeConfig = {
    large: {
      container: 'w-64',
      image: 'w-56 h-56',
      nameSize: 'text-xl',
      positionSize: 'text-sm',
      padding: 'p-6',
    },
    medium: {
      container: 'w-56',
      image: 'w-48 h-48',
      nameSize: 'text-lg',
      positionSize: 'text-xs',
      padding: 'p-5',
    },
    small: {
      container: 'w-48',
      image: 'w-40 h-40',
      nameSize: 'text-base',
      positionSize: 'text-xs',
      padding: 'p-4',
    },
  };

  const config = sizeConfig[size] ?? sizeConfig.small;

  const LinkedInIcon = FaLinkedin || null;
  const GitHubIcon = FaGithub || null;

  return (
    <div className={`${config.container} transition-transform duration-300 hover:-translate-y-2`}>
      <div
        className={`relative bg-white rounded-2xl ${config.padding}
          border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#ca0002]/20 transition-all duration-300`}
      >
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div
              className={`relative ${config.image} rounded-full overflow-hidden border-4 border-gray-50 group-hover:border-[#ca0002]/10 transition-colors duration-300 shadow-inner`}
            >
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://dummyimage.com/800x800/f3f4f6/1f2937&text=No+Image';
                }}
              />
            </div>
          </div>

          {/* Name + position */}
          <h3
            className={`text-gray-900 font-bold ${config.nameSize} text-center mb-1 group-hover:text-[#ca0002] transition-colors`}
          >
            {name}
          </h3>
          <p
            className={`text-gray-500 font-medium ${config.positionSize} text-center leading-relaxed mb-3`}
          >
            {position}
          </p>

          {/* Socials */}
          <div className="flex gap-3">
            {linkedin && typeof linkedin === 'string' && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn profile of ${name}`}
                className="text-gray-400 hover:text-[#0077b5] transition-colors duration-200"
              >
                {LinkedInIcon ? <LinkedInIcon size={18} /> : 'LI'}
              </a>
            )}
            {github && typeof github === 'string' && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub profile of ${name}`}
                className="text-gray-400 hover:text-black transition-colors duration-200"
              >
                {GitHubIcon ? <GitHubIcon size={18} /> : 'GH'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
