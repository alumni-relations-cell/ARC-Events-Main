import TeamMember from './TeamMember';

export default function DepartmentSection({ name, icon: Icon, members }) {
  return (
    <div className="relative">
      <div
        className="relative bg-white rounded-3xl p-6 md:p-10
        border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="p-3 bg-red-50 rounded-xl">
            <Icon className="w-6 h-6 text-[#ca0002]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">
            {name}
          </h3>
        </div>

        {/* 
            Desktop: grid-cols-5 to fit all members in one row (e.g. Media has 5).
            Mobile/Tablet: grid-cols-1 or 2 as needed.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center">
          {members.map((member, index) => (
            <div key={index} className="group">
              <TeamMember {...member} size="small" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
