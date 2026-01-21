import { Users, Code, Palette, Camera, FileText } from 'lucide-react';
import TeamMember from '../../components/TeamMember';
import DepartmentSection from '../../components/DepartmentSection';

function App() {
  const facultyHeads = [
    {
      name: 'Ms. Mansi Bhargava', // Fixed spacing
      position: 'Head Of Alumni Relations',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841017/mansi_akgkm7.jpg',
      linkedin: 'https://www.linkedin.com/in/thapar-alumni-relations-office/',
    },
    {
      name: 'Ms. Deepika',
      position: 'Senior Associate',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841222/deepika_z5i7st.jpg',
      linkedin: 'https://www.linkedin.com/in/thapar-alumni-relations-office/',
    },
  ];

  const studentLeads = [
    {
      name: 'Anmol Sethi',
      position: 'President',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762846085/anmolllllllll_ctrskb.jpg',
      linkedin: 'https://www.linkedin.com/in/anmol-sethi-79ba03228/',
    },
    {
      name: 'Rakshit Dhamija',
      position: 'Outreach and Communication Head',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762807072/me_-_RAKSHIT_DHAMIJA_hk2ruf.jpg',
      linkedin: 'https://www.linkedin.com/in/rakshit-dhamija-870b39286/',
      github: 'https://github.com/Rakshit-Dhamija',
    },
    {
      name: 'Kushagrh Rohilla',
      position: 'Executive Head',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841870/jatta_ka_chora_sicgc6.jpg',
      linkedin: 'https://www.linkedin.com/in/kushagrhrohilla/',
      github: 'https://github.com/Infurnux',
    },
    {
      name: 'Angad Bir Singh',
      position: 'Executive Head',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762860088/anagdd_rc4vc6.jpg',
      linkedin: 'https://www.linkedin.com/in/angad-bir-singh-45507a281/',
      github: 'https://github.com/Angadbir101',
    },
  ];

  const departments = [
    {
      name: 'Tech Department',
      icon: Code,
      members: [
        {
          name: 'Garv Noor Sandha',
          position: 'Tech Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762839758/Profile_LINK_x49mdb.jpg',
          linkedin: 'https://www.linkedin.com/in/garvsandha/',
          github: 'https://github.com/Garrvvvvvv',
        },
         {
          name: 'Ayushi Kaushal',
          position: 'Tech Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841628/ayushi_jc8dul.jpg',
          linkedin: 'https://www.linkedin.com/in/ayushi-kaushal',
          github: 'https://github.com/AyushiK16',
        },
        
      ],
    },
    {
      name: 'Design Department',
      icon: Palette,
      members: [
        {
          name: 'Vani Sinha',
          position: 'Design Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762840620/vani_mjtrdb.jpg',
          linkedin: 'https://www.linkedin.com/in/vani-sinha-41988a335/',
          github: 'https://github.com/vanii04',
        },
        {
          name: 'Anjali Kumari',
          position: 'Design Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762842494/anjali_kqya84.jpg',
          linkedin: 'https://www.linkedin.com/in/anjali-kumari-aa7668323/',
          github: 'https://github.com/Anjalikumari990',
        },
       
        {
          name: 'Dishita Bansal',
          position: 'Design Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762806636/WhatsApp_Image_2025-08-25_at_12.22.32_PM_2_-_Dishita_Bansal_wu2ewx.jpg',
          linkedin: 'https://www.linkedin.com/in/dishita-bansal/',
          github: 'https://github.com/Dishita-Bansal',
        },
      ],
    },
    {
      name: 'Media Department',
      icon: Camera,
      members: [
        {
          name: 'Agami',
          position: 'Media Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762806538/IMG_1956_-_Agami_1_tqrpmx.jpg',
          linkedin: 'https://www.linkedin.com/in/agami-garg-608692308/',
        },
        {
          name: 'Anmol Mittal',
          position: 'Media Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762805858/Anmol_Mittal_it9ct9.jpg',
          linkedin: 'https://www.linkedin.com/in/anmol-mittal-75506337b',
          github: 'https://github.com/CoderAnmolMittal',
        },
        {
          name: 'Prisha Bharti ',
          position: 'Media Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762843678/prisha_yhh7lh.jpg',
          linkedin:
            'https://www.linkedin.com/in/prisha-bharti-8527b02b9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
        },
        {
          name: 'Ansh Bansal',
          position: 'Media Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762842283/ansh_vna422.jpg',
          linkedin: 'https://www.linkedin.com/in/anshbansal1002/',
          github: 'https://github.com/CoderAnmolMittal',
        },
        {
          name: 'Siya Garg',
          position: 'Media Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762845896/Siya_gnlt2o.jpg',
          linkedin:
            'https://www.linkedin.com/in/siya-garg-b954a322b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        },
      ],
    },
    {
      name: 'Content Department',
      icon: FileText,
      members: [
        {
          name: 'Parnika Bharadvaja',
          position: 'Content Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762806927/PArnika_zmozxm.jpg',
          linkedin:
            'https://www.linkedin.com/in/parnika-bharadvaja-14029b343?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        },
        {
          name: 'Harshil Jain',
          position: 'Content Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762840753/harshil123_rlybmj.png',
          linkedin: 'https://www.linkedin.com/in/harshil-jain-13a87731a',
          github: 'https://github.com/jainharshil34',
        },
       
        {
          name: 'Tishya Pandey',
          position: 'Content Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762843363/tisha_gudtwu.jpg',
          linkedin:
            'https://www.linkedin.com/in/tishya-pandey-327155363?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative pt-12 pb-20">
      <div className="relative">
        <header className="text-center py-8 px-4">
          <h1 className="mt-3 mb-3 text-4xl md:text-5xl font-bold text-[#ca0002] font-serif tracking-tight">
            Meet Our Team
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-sm">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Alumni Relations Cell
            </span>
          </div>
        </header>

        <section className="max-w-[1400px] mx-auto px-4 py-6">
          {/* Faculty Heads */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">
              Faculty Heads
            </h2>
            <div className="w-16 h-1 bg-[#ca0002] mx-auto mt-2 rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mb-20">
            {facultyHeads.map((member, index) => (
              <div key={index} className="group">
                <TeamMember {...member} size="large" />
              </div>
            ))}
          </div>

          {/* Student Leadership */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">
              Student Leadership
            </h2>
            <div className="w-16 h-1 bg-[#ca0002] mx-auto mt-2 rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mb-20">
            {studentLeads.map((member, index) => (
              <div key={index} className="group">
                <TeamMember {...member} size="medium" />
              </div>
            ))}
          </div>

          {/* Departments */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">
              Departments
            </h2>
            <div className="w-16 h-1 bg-[#ca0002] mx-auto mt-2 rounded"></div>
          </div>
          <div className="space-y-16 mb-24">
            {departments.map((dept, index) => (
              <DepartmentSection key={index} {...dept} />
            ))}
          </div>

          {/* ✅ Group Photo Section */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif mb-4">
              Our Full Team
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-2xl mx-auto">
              A snapshot of everyone who makes the Alumni Relations Cell thrive.
            </p>
            <div className="max-w-6xl mx-auto p-2 bg-white rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://res.cloudinary.com/dbl2so7ff/image/upload/v1762925092/team_hokwxb.jpg"
                alt="ARC Team Group Photo"
                className="rounded-xl w-full object-cover grayscale-0 hover:grayscale transition-all duration-500"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;
