import React from 'react';

export const posMockStaff = [
  { 
    id: 1, 
    name: "Marco V.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwsjN4xWZ4toLEd9PiwInqKSBYZ4ltUKHatPGZGWfosk2LkhHeYyvESCclB9X3f0uB7wfR2OJC1TRmPc5WQw7Q48k19t4Anjz7SrI7CDwEd7KTdpUc4BPpQ2yfi3tYV08W8kleBxDQNwUugm1jtuGMphj026HCBW34Uykm3NbRkQst4w12AMAr_jDZtZfQUbY18fNDFxCa66lyxbfvEUszQ3RitmqRb1XqmnvQMeKs4jQ-7CCWNXFrmYPBpFxgg3vees77X6DlfCc9" 
  },
  { 
    id: 2, 
    name: "Julian K.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8mZYsnGi2GYvPGFU8HmeIlRSMFi507XwJIGKBxgHyZsiYYqvWGdfwMqqZ48slWf3ISCr0odYo0Ej1P7dQtF5tIGwoRLQbYYUuQAL-B75gvngDPgGECpSyt1oA2cQTOXfFYT165tmpivoAF1WOS3TC87Q12xKL6MWOBf4POsY7Cl5s6W5eeSg-IZ4tQ8scZArytC3rxXR-IgLirqmMUz7B-syyS5oWmbIEo-tZ8Qzh-o2pTouD8yOZgG7eZS8VrQR8iQ6HABivEiXF" 
  },
  { 
    id: 3, 
    name: "Sasha L.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm3HX1mYoIobhNfIzeQyuI91EiyPjILstNxroLRcvvK4uODt_ZVxNoUlzjyxVpEHvq4eJJYS6DSq5ijiaTmPn8kwfe5_CEqIgBOFYU02T-l5BTWaf05mdWIxeG3pa8i_QFgHiE-VWUmuyIaVcvSjSYAFxps_U_4tnG3cDXrCE_jobP5qud_nWBKNbpqhhbDmwTve2cBdGYTSNEB6qEOHd8VLIsGfH5DueQpU6e9w-zp-RtQviH-cn7HQQMyanPyfF60L60ehWXlmYM" 
  },
  { 
    id: 4, 
    name: "Arthur G.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBUTB6KGB8Ct8PRo8nmlISU3s90D4-gQS_49pgRREGHqPdckCmIMaubo0lAGJ7Nbh1dN0bujWPbgkAK8-xJpe46ZVC5eIKNWE4OOsFgI6BE2Ss-X_Ow_OoTGLg1Vg8Z0A3i1VD4oP-b7neTqFGwjvtyt-hp0VDwTcNkcuyBRWc_h9LZyE_s60GOYQkhctYRBQ6w7uAi64fQBwwM4oTWHDHrQNgzM8ConOu4Yrcdp1IjHbnbt8k7pCQ8SWAV9jIDOKcVL1ORfcGl7C8" 
  },
];

export default function POSStaffSelection({ selectedStaff, setSelectedStaff }) {
  return (
    <div className="mb-8">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Assign Staff</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {posMockStaff.map((staff) => {
          const isSelected = selectedStaff?.id === staff.id;
          return (
            <div 
              key={staff.id}
              onClick={() => setSelectedStaff(staff)}
              className={`flex-shrink-0 w-28 glass-card p-3 rounded-lg flex flex-col items-center gap-2 cursor-pointer border transition-all ${
                isSelected ? 'active-staff border-primary bg-primary/10' : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                isSelected ? 'border-primary' : 'border-outline-variant'
              }`}>
                <img 
                  className="w-full h-full object-cover" 
                  src={staff.image} 
                  alt={staff.name} 
                />
              </div>
              <span className={`font-label-md text-xs text-center ${
                isSelected ? 'text-primary' : 'text-on-surface'
              }`}>
                {staff.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
