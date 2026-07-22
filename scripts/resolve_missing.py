import json

translations = {
  "maintenance_requests": {
    "en": "Maintenance Requests",
    "fr": "Demandes d'entretien",
    "rw": "Gusaba gusanirwa",
    "sw": "Maombi ya Matengenezo"
  },
  "manage_maintenance_desc": {
    "en": "Create and track maintenance requests for your rented properties.",
    "fr": "Créez et suivez les demandes d'entretien pour vos propriétés louées.",
    "rw": "Kora kandi ukurikirane ibibazo byo gusanirwa ku nzu ukodesha.",
    "sw": "Unda na ufuatilie maombi ya matengenezo ya nyumba unazokodi."
  },
  "new_request": {
    "en": "New Request",
    "fr": "Nouvelle demande",
    "rw": "Gusaba gushya",
    "sw": "Ombi Jipya"
  },
  "new_maintenance_request": {
    "en": "New Maintenance Request",
    "fr": "Nouvelle demande d'entretien",
    "rw": "Gusaba gusanirwa gushya",
    "sw": "Ombi Jipya la Matengenezo"
  },
  "maintenance_request_help": {
    "en": "Specify the property and write a detailed description of the maintenance issue.",
    "fr": "Spécifiez la propriété et écrivez une description détaillée du problème.",
    "rw": "Hitamo inzu hanyuma usobanure byimazeyo ikibazo gihari.",
    "sw": "Chagua nyumba na uandike maelezo ya kina ya tatizo la matengenezo."
  },
  "select_property": {
    "en": "Select Property",
    "fr": "Sélectionner la propriété",
    "rw": "Hitamo inzu",
    "sw": "Chagua Nyumba"
  },
  "maintenance_title_placeholder": {
    "en": "e.g. Broken water pipe, electrical issues...",
    "fr": "ex: Tuyau d'eau cassé, problème électrique...",
    "rw": "Urugero: Umuvuduko w'amazi/umuriro, gushya ku nsinga...",
    "sw": "Mfano: Bomba la maji lililovunjika, matatizo ya umeme..."
  },
  "maintenance_desc_placeholder": {
    "en": "Detail the issue here. Be as descriptive as possible so the owner can respond quickly.",
    "fr": "Détaillez le problème ici. Soyez le plus précis possible afin que le propriétaire réagisse vite.",
    "rw": "Sobanura ikibazo mu buryo burambuye kugira ngo nyir'inzu agikemure vuba.",
    "sw": "Eleza tatizo hapa kwa kina ili mmiliki aweze kuchukua hatua haraka."
  },
  "search_requests": {
    "en": "Search requests...",
    "fr": "Rechercher des demandes...",
    "rw": "Shakisha ibyasabwe...",
    "sw": "Tafuta maombi..."
  },
  "no_requests": {
    "en": "No maintenance requests",
    "fr": "Aucune demande d'entretien",
    "rw": "Nta bikorwa byo gusanirwa byasabwe",
    "sw": "Hakuna maombi ya matengenezo"
  },
  "no_requests_description": {
    "en": "You don't have any maintenance requests logged in the system.",
    "fr": "Vous n'avez aucune demande d'entretien enregistrée.",
    "rw": "Nta bikorwa byo gusanirwa birandikwa muri sisitemu.",
    "sw": "Huna maombi yoyote ya matengenezo kwenye mfumo."
  },
  "submitted_by": {
    "en": "Submitted by",
    "fr": "Soumis par",
    "rw": "Yashyikirijwe na",
    "sw": "Imewasilishwa na"
  },
  "maintenance_request_created": {
    "en": "Maintenance request submitted successfully!",
    "fr": "Demande d'entretien soumise avec succès !",
    "rw": "Gusaba gusanirwa byoherejwe neza!",
    "sw": "Ombi la matengenezo limewasilishwa kikamilifu!"
  },
  "failed_to_create_request": {
    "en": "Failed to submit request. Please try again.",
    "fr": "Échec de l'envoi de la demande. Veuillez réessayer.",
    "rw": "Gusaba gusanirwa byanze. Ongera ugerageze.",
    "sw": "Imeshindikana kuwasilisha ombi. Tafadhali jaribu tena."
  },
  "rental_contracts": {
    "en": "Rental Contracts",
    "fr": "Contrats de location",
    "rw": "Amasezerano y'ubukode",
    "sw": "Mikataba ya Kupangisha"
  },
  "manage_your_lease_agreements": {
    "en": "Generate, sign, and view all active lease agreements.",
    "fr": "Générez, signez et consultez tous les contrats de location actifs.",
    "rw": "Kora, shyiraho umukono, kandi urebe amasezerano y'ubukode yose afite agaciro.",
    "sw": "Tengeneza, saini, na uangalie mikataba yote ya kupangisha."
  },
  "create_contract": {
    "en": "Create Lease",
    "fr": "Créer le bail",
    "rw": "Kora amasezerano",
    "sw": "Tengeneza Mkataba"
  },
  "generate_new_contract": {
    "en": "Generate New Contract",
    "fr": "Générer un nouveau contrat",
    "rw": "Kora amasezerano mashya",
    "sw": "Tengeneza Mkataba Mpya"
  },
  "generate_contract_subtitle": {
    "en": "Select an approved booking to turn it into an official lease contract.",
    "fr": "Sélectionnez une réservation approuvée pour la transformer en bail officiel.",
    "rw": "Hitamo ubukode bwemejwe kugira ngo ukore amasezerano yemewe.",
    "sw": "Chagua uhifadhi uliokubaliwa ili kuugeuza kuwa mkataba rasmi."
  },
  "select_booking": {
    "en": "Select Booking",
    "fr": "Sélectionner la réservation",
    "rw": "Hitamo ubukode",
    "sw": "Chagua uhifadhi"
  },
  "lease_agreement": {
    "en": "Lease Agreement",
    "fr": "Contrat de bail",
    "rw": "Amasezerano y'ubukode",
    "sw": "Mikataba ya Kupangisha"
  },
  "download_started": {
    "en": "Preparing agreement PDF...",
    "fr": "Préparation du contrat PDF...",
    "rw": "Gupakira amasezerano mu buryo bwa PDF...",
    "sw": "Kuandaa PDF ya mkataba..."
  },
  "download_pdf": {
    "en": "Download PDF",
    "fr": "Télécharger PDF",
    "rw": "Manura PDF",
    "sw": "Pakua PDF"
  },
  "contract_generated": {
    "en": "Contract generated successfully!",
    "fr": "Contrat généré avec succès !",
    "rw": "Amasezerano yakozwe neza!",
    "sw": "Mkataba umetengenezwa kikamilifu!"
  },
  "failed_to_generate_contract": {
    "en": "Failed to generate lease. Please try again.",
    "fr": "Impossible de générer le bail. Veuillez réessayer.",
    "rw": "Gukora amasezerano byanze. Ongera ugerageze.",
    "sw": "Imeshindikana kutengeneza mkataba. Tafadhali jaribu tena."
  },
  "terminate_contract_confirm": {
    "en": "Are you sure you want to terminate this contract?",
    "fr": "Êtes-vous sûr de vouloir résilier ce contrat ?",
    "rw": "Ese ufite ikizere ko ushaka gusesa aya masezerano?",
    "sw": "Je, una uhakika unataka kusitisha mkataba huu?"
  },
  "contract_terminated": {
    "en": "Contract terminated status applied.",
    "fr": "Statut de résiliation appliqué au contrat.",
    "rw": "Amasezerano yaseshwe neza.",
    "sw": "Mkataba umesitishwa kikamilifu."
  },
  "failed_to_terminate_contract": {
    "en": "Failed to terminate. Please try again.",
    "fr": "Résiliation impossible. Veuillez réessayer.",
    "rw": "Gusesa amasezerano byanze. Ongera ugerageze.",
    "sw": "Imeshindikana kusitisha. Tafadhali jaribu tena."
  },
  "no_contracts": {
    "en": "No contracts found",
    "fr": "Aucun contrat trouvé",
    "rw": "Nta masezerano yabonetse",
    "sw": "Hakuna mikataba iliyopatikana"
  },
  "no_contracts_description": {
    "en": "Lease agreements will appear here once generated from bookings.",
    "fr": "Les contrats de location s'afficheront ici après génération.",
    "rw": "Amasezerano y'ubukode azagaragara hano amaze gukorwa mu bukode bwishyuwe.",
    "sw": "Mikataba itatokea hapa itakapoundwa kutoka kwa uhifadhi."
  },
  "pay_now": {
    "en": "Pay Deposit & Rent",
    "fr": "Payer caution et loyer",
    "rw": "Kwishura ingwate & ubukode",
    "sw": "Lipa Amana na Kodi"
  },
  "complete_rental_payment": {
    "en": "Complete Rental Payment",
    "fr": "Compléter le paiement de location",
    "rw": "Uzuza ikwishura ry'ubukode",
    "sw": "Kamilisha Malipo ya Kodi"
  },
  "payment_momo_card_desc": {
    "en": "Select MoMo or Visa to complete your payments.",
    "fr": "Sélectionnez MoMo ou Visa pour effectuer vos paiements.",
    "rw": "Hitamo MoMo cyangwa Visa kugira ngo wishyure.",
    "sw": "Chagua MoMo ama Visa ili kukamilisha malipo."
  },
  "payment_method": {
    "en": "Payment Method",
    "fr": "Moyen de paiement",
    "rw": "Uburyo bwo kwishura",
    "sw": "Njia ya Malipo"
  },
  "confirm_and_pay": {
    "en": "Confirm & Pay",
    "fr": "Confirmer & Payer",
    "rw": "Emeza & Wishyure",
    "sw": "Thibitisha na Ulipe"
  },
  "processing_payment": {
    "en": "Processing payment...",
    "fr": "Traitement du paiement...",
    "rw": "Ikwishura ririmo gukorwa...",
    "sw": "Malipo yanashughulikiwa..."
  },
  "payment_successful": {
    "en": "Payment Successful!",
    "fr": "Paiement réussi !",
    "rw": "Kwishura byagenze neza!",
    "sw": "Malipo Yamekamilika!"
  },
  "payment_success_booking_complete": {
    "en": "Your payment has been registered. Booking is now complete.",
    "fr": "Votre paiement a été enregistré. La réservation est maintenant complète.",
    "rw": "Ikwishura ryanyu ryakiriwe. Ubukode bwemejwe neza.",
    "sw": "Malipo yako yamesajiliwa. Uhifadhi sasa umekamilika."
  },
  "initiating_payment_protocol": {
    "en": "Initiating secure payment gateway connection...",
    "fr": "Connexion sécurisée à la passerelle de paiement...",
    "rw": "Gufungura urubuga rwizewe rwo kwishura...",
    "sw": "Kuanzisha muunganisho salama wa malipo..."
  },
  "waiting_for_momo_approval": {
    "en": "Please check your phone for the PIN code request prompt...",
    "fr": "Veuillez vérifier votre téléphone pour la saisie du code PIN...",
    "rw": "Reba kuri terefone yawe wandikemo umubare w'ibanga wa MoMo...",
    "sw": "Tafadhali angalia simu yako ili uweke namba ya siri..."
  },
  "verifying_transaction_status": {
    "en": "Verifying transaction with telecom/bank networks...",
    "fr": "Vérification de la transaction auprès de la banque...",
    "rw": "Kugenzura ikwishura muri telecom/banki...",
    "sw": "Kuhakikisha muamala na mtandao..."
  },
  "payment_failed": {
    "en": "Payment transaction failed. Try again.",
    "fr": "Le paiement a échoué. Réessayez.",
    "rw": "Kwishura ntabwo bikunze. Ongera ugerageze.",
    "sw": "Malipo yameshindikana. Jaribu tena."
  },
  "search_contracts": {
    "en": "Search contracts...",
    "fr": "Rechercher des contrats...",
    "rw": "Shakisha amasezerano...",
    "sw": "Tafuta mikataba..."
  },
  "total": {
    "en": "Total Price",
    "fr": "Prix total",
    "rw": "Igiteranyo",
    "sw": "Jumla"
  },
  "phone_number": {
    "en": "Phone Number",
    "fr": "Numéro de téléphone",
    "rw": "Numero ya telefone",
    "sw": "Nambari ya Simu"
  },
  "card_number": {
    "en": "Card Number",
    "fr": "Numéro de carte",
    "rw": "Numero y'ikarita",
    "sw": "Nambari ya Kadi"
  },
  "expiry": {
    "en": "Expiry (MM/YY)",
    "fr": "Expiration (MM/AA)",
    "rw": "Itariki yo kurangira (MM/YY)",
    "sw": "Muda wa kumalizika (MM/YY)"
  },
  "cancel": {
    "en": "Cancel",
    "fr": "Annuler",
    "rw": "Kureka",
    "sw": "Ghairi"
  },
  "high": {
    "en": "High Priority",
    "fr": "Priorité haute",
    "rw": "Ubutumwa bwihuse",
    "sw": "Kipaumbele cha Juu"
  },
  "low": {
    "en": "Low Priority",
    "fr": "Priorité basse",
    "rw": "Ubutumwa buciriritse",
    "sw": "Kipaumbele cha Chini"
  },
  "medium": {
    "en": "Medium Priority",
    "fr": "Priorité moyenne",
    "rw": "Agaciro karinganiye",
    "sw": "Kipaumbele cha Kati"
  },
  "urgent": {
    "en": "Urgent",
    "fr": "Urgent",
    "rw": "Byihutirwa cyane",
    "sw": "Haraka"
  },
  "terminate": {
    "en": "Terminate",
    "fr": "Résilier",
    "rw": "Gusesa",
    "sw": "Sitisha"
  },
  "generating": {
    "en": "Generating...",
    "fr": "Génération...",
    "rw": "Bikomeje...",
    "sw": "Inatayarisha..."
  },
  "monthly_rent": {
    "en": "Monthly Rent",
    "fr": "Loyer mensuel",
    "rw": "Ubukode bwa buri kwezi",
    "sw": "Kodi ya Kila Mwezi"
  },
  "start_date": {
    "en": "Start Date",
    "fr": "Date de début",
    "rw": "Itariki yo gutangira",
    "sw": "Tarehe ya Kuanza"
  },
  "end_date": {
    "en": "End Date",
    "fr": "Date de fin",
    "rw": "Itariki yo kurangira",
    "sw": "Tarehe ya Mwisho"
  },
  "contracts": {
    "en": "Contracts",
    "fr": "Contrats",
    "rw": "Amasezerano",
    "sw": "Mikataba"
  },
  "maintenance": {
    "en": "Maintenance",
    "fr": "Entretien",
    "rw": "Gusanirwa",
    "sw": "Matengenezo"
  }
}

languages = ["en", "fr", "rw", "sw"]

for lang in languages:
    path = f"src/i18n/locales/{lang}.json"
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}

    for key, vals in translations.items():
        # Always write or update the keys with our custom translations
        if lang in vals:
            data[key] = vals[lang]

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Synchronized new keys across all locale files successfully!")
