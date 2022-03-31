from pyteal import *


#The name of the contract can be changed to whatever you like
def contract_name():
    
 
    
    contract_deployment = Seq([
        App.globalPut(Bytes("owner"), Txn.sender()),
        App.globalPut(Bytes("Counter"), Int(0)),
        Approve(),
    ])


    scratchCount = ScratchVar(TealType.uint64)
    utility_Function = Seq([
        scratchCount.store(App.globalGet(Bytes("Counter"))), #putting the current value of counter in scratch space
        App.globalPut(Bytes("Counter"), scratchCount.load() + Int(1)), #then we are changing the value of counter by adding 1
        Approve(),
    ])


    on_call_method = Txn.application_args[0]
    contract_interface = Cond(
        [on_call_method == Bytes("change"), utility_Function], 
      )



    on_call_method = Txn.application_args[0]
    on_call = Cond(
        [on_call_method == Bytes("arguement-passed"), utility_Function],
    )

    is_owner = Txn.sender() == App.globalGet(Bytes("owner"))
    program = Cond(
        [Txn.application_id() == Int(0), contract_deployment],
        [Txn.on_completion() == OnComplete.NoOp, contract_interface],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_owner)],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_owner)],
    )

    return program


""" Clear Contract """
def clear_state_program():
    return Reject()


if __name__ == "__main__":
    with open("approval.teal", "w") as f:
        compiled = compileTeal(contract_name(), mode=Mode.Application, version=5)
        f.write(compiled)

    with open("clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled)